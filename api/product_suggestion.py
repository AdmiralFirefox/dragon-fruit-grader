def product_suggestion(grading_result):
    products = {
        "extra class": [
            "Cooked vegetable meals", "Dragon fruit skin with caramelized sugar",
            "Dragon fruit jam", "Dragon fruit gummies", "Dragon Fruit Juice",
            "Dragon Fruit Smoothie", "Dragon Fruit rice cakes", "Dragon Fruit Cookies"
        ],
        "class 1": [
            "Dragon Fruit Noodles", "Dragon Fruit Marinating Sauce", "Dragon Fruit Juice",
            "Dragon Fruit Smoothie", "Dragon Fruit Chips", "Dragon Fruit rice cakes",
            "Dragon Fruit Cookies", "Dragon Fruit Ketchup"
        ],
        "class 2": [
            "Dragon Fruit Noodles", "Wine", "Soap"
        ]
    }
    
    # Normalize the input to lower case to ensure case-insensitive comparison
    grading_result = grading_result.lower()
    
    # Check if the class exists in the dictionary
    if grading_result in products:
        return products[grading_result]
    else:
        return ["No products available for this class."]