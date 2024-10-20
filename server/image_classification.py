import torch
from torchvision import models, transforms
from PIL import Image
import torch.nn.functional as F
from product_suggestion import product_suggestion

def image_classification(cropped_images_full_path, grading_results, product_suggestions, class_lists, class_probabilities):
    # Define class names
    class_names = ['Class 1', 'Class 2', 'Extra Class', 'Reject', 'Reject (Unripe)']

    # Load the pre-trained ResNet model
    model = models.resnet50(weights=None)  
    num_ftrs = model.fc.in_features

    # Replace the fully connected layer
    num_classes = 5  # Number of Classes
    model.fc = torch.nn.Linear(num_ftrs, num_classes)

    # Load the state dictionary
    state_dict = torch.load("saved_models/resnet50_model.pth", map_location=torch.device("cpu"))

    # Rename keys in the state dictionary
    new_state_dict = {}
    for key, value in state_dict.items():
        if key.startswith('fc.1.'):
            new_key = key.replace('fc.1.', 'fc.')
            new_state_dict[new_key] = value
        else:
            new_state_dict[key] = value

    # Load the modified state dictionary into the model
    model.load_state_dict(new_state_dict)

    # Set the model to evaluation mode
    model.eval()

    # Define image transformation
    preprocess = transforms.Compose([
        transforms.Resize((224, 224)), # Resize
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    # Predicting multiple images
    for image_path in cropped_images_full_path:
        # Load and preprocess the image
        img = Image.open(image_path)
        img_t = preprocess(img)
        batch_t = torch.unsqueeze(img_t, 0)
        
        # Make predictions
        with torch.no_grad():
            out = model(batch_t)
        
        # Apply softmax to get probabilities
        probabilities = F.softmax(out, dim=1)
        
        _, predicted = torch.max(out, 1)
        predicted_class = class_names[predicted]
        
        # print("The predicted class is", predicted_class)
        grading_results.append(predicted_class)

        product_suggestions.append(product_suggestion(predicted_class))

        # Probabilities of all classes
        current_class_lists_batch = []
        current_class_probabilities_batch = []

        for i, class_name in enumerate(class_names):
            class_prob = probabilities[0][i].item() * 100

            current_class_lists_batch.append(class_name)
            current_class_probabilities_batch.append(class_prob)

            if len(current_class_lists_batch) == len(class_names):
                class_lists.append(current_class_lists_batch)
                current_class_lists_batch  = []

            if len(current_class_probabilities_batch) == len(class_names):
                class_probabilities.append(current_class_probabilities_batch)
                current_class_probabilities_batch = []
        
        if current_class_lists_batch:
             class_lists.append(current_class_lists_batch)
        
        if current_class_probabilities_batch:
             class_probabilities.append(current_class_probabilities_batch)