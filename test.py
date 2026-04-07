class Test:
    name : str = "abc"
    number : int = 0

    def __init__(self, number):
        pass

test = Test(6)
print(f"name : {test.name}, number : {test.number}")