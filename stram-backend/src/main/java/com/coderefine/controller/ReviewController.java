package com.coderefine.controller;

import com.coderefine.dto.CodeSubmission;
import com.coderefine.dto.ReviewListItem;
import com.coderefine.model.Review;
import com.coderefine.model.User;
import com.coderefine.repository.ReviewRepository;
import com.coderefine.service.AiService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class ReviewController {

    private final ReviewRepository reviewRepo;
    private final AiService aiService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ReviewController(ReviewRepository reviewRepo, AiService aiService) {
        this.reviewRepo = reviewRepo;
        this.aiService = aiService;
    }

    @PostMapping("/review")
    public ResponseEntity<JsonNode> submitReview(
            @Valid @RequestBody CodeSubmission submission,
            @AuthenticationPrincipal User user) {

        if (submission.getCode().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Code cannot be empty");
        }

        JsonNode result = aiService.reviewCode(submission.getCode(), submission.getLanguage());

        Review review = new Review();
        review.setUser(user);
        review.setLanguage(submission.getLanguage());
        review.setOriginalCode(submission.getCode());
        review.setRefactoredCode(result.path("refactored_code").asText(""));
        review.setScore(result.path("summary").path("score").asDouble(0));
        review.setCriticalCount(result.path("summary").path("critical").asInt(0));
        review.setHighCount(result.path("summary").path("high").asInt(0));
        review.setMediumCount(result.path("summary").path("medium").asInt(0));
        review.setLowCount(result.path("summary").path("low").asInt(0));

        try {
            review.setIssuesJson(objectMapper.writeValueAsString(result.path("issues")));
        } catch (Exception e) {
            review.setIssuesJson("[]");
        }

        reviewRepo.save(review);

        ObjectNode response = result.deepCopy();
        response.put("review_id", review.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/reviews")
    public ResponseEntity<List<ReviewListItem>> getReviews(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "20") int limit) {

        List<Review> reviews = reviewRepo.findByUserIdOrderByCreatedAtDesc(
                user.getId(), PageRequest.of(0, limit));

        List<ReviewListItem> items = reviews.stream().map(r -> new ReviewListItem(
                r.getId(), r.getLanguage(), r.getScore(),
                r.getCriticalCount(), r.getHighCount(), r.getMediumCount(), r.getLowCount(),
                r.getCreatedAt(), r.getOriginalCode(), r.getRefactoredCode(), r.getIssuesJson()
        )).collect(Collectors.toList());

        return ResponseEntity.ok(items);
    }

    @GetMapping("/reviews/{id}")
    public ResponseEntity<ObjectNode> getReview(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {

        Review review = reviewRepo.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found"));

        ObjectNode resp = objectMapper.createObjectNode();
        resp.put("id", review.getId());
        resp.put("language", review.getLanguage());
        resp.put("original_code", review.getOriginalCode());
        resp.put("refactored_code", review.getRefactoredCode());
        resp.put("score", review.getScore());

        ObjectNode summary = resp.putObject("summary");
        summary.put("score", review.getScore());
        summary.put("critical", review.getCriticalCount());
        summary.put("high", review.getHighCount());
        summary.put("medium", review.getMediumCount());
        summary.put("low", review.getLowCount());

        try {
            JsonNode issues = objectMapper.readTree(review.getIssuesJson() != null ? review.getIssuesJson() : "[]");
            resp.set("issues", issues);
        } catch (Exception e) {
            resp.putArray("issues");
        }

        resp.put("created_at", review.getCreatedAt().toString());
        return ResponseEntity.ok(resp);
    }

    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<Map<String, String>> deleteReview(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {

        Review review = reviewRepo.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found"));

        reviewRepo.delete(review);
        return ResponseEntity.ok(Map.of("message", "Review deleted"));
    }

    @GetMapping("/stats")
    public ResponseEntity<ObjectNode> getStats(@AuthenticationPrincipal User user) {
        List<Review> reviews = reviewRepo.findAllByUserId(user.getId());
        ObjectNode stats = objectMapper.createObjectNode();

        if (reviews.isEmpty()) {
            stats.put("total", 0);
            stats.put("avg_score", 0);
            stats.put("total_issues", 0);
            stats.putObject("languages");
            return ResponseEntity.ok(stats);
        }

        int total = reviews.size();
        double avgScore = reviews.stream().mapToDouble(Review::getScore).average().orElse(0);
        int totalIssues = reviews.stream()
                .mapToInt(r -> r.getCriticalCount() + r.getHighCount() + r.getMediumCount() + r.getLowCount())
                .sum();

        stats.put("total", total);
        stats.put("avg_score", Math.round(avgScore * 10.0) / 10.0);
        stats.put("total_issues", totalIssues);

        ObjectNode langs = stats.putObject("languages");
        reviews.stream()
                .collect(Collectors.groupingBy(Review::getLanguage, Collectors.counting()))
                .forEach(langs::put);

        return ResponseEntity.ok(stats);
    }
}
