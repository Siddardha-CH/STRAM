from rewrite_engine import rewrite_code

sample = """
def add(a,b):
 return a+b
"""

print(rewrite_code(sample, "python"))
