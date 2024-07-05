from cloudinary import uploader
import os
import re

def delete_files_with_pattern(directory, pattern):
    regex = re.compile(pattern)
    
    # List all files in the directory
    for filename in os.listdir(directory):
        # Check if the pattern exists in the filename
        if regex.search(filename):
            file_path = os.path.join(directory, filename)
            
            # Delete the file
            try:
                os.remove(file_path)
                print(f"Deleted: {file_path}")
            except OSError as e:
                print(f"Error deleting {file_path}: {e}")


def remove_from_cloudinary(local_directory, session_id):
    # Get list of files in the local directory
    local_files = os.listdir(local_directory)
    
    # Iterate through each file and delete from Cloudinary if it matches the session id
    for filename in local_files:
        if session_id in filename:
            try:
                # Remove file extension to get the public ID
                public_id = os.path.splitext(filename)[0]
                
                # Delete the image from Cloudinary
                result = uploader.destroy(public_id)
                
                if result.get('result') == 'ok':
                    print(f"Successfully deleted {filename} from Cloudinary")
                else:
                    print(f"Failed to delete {filename} from Cloudinary")
            
            except Exception as e:
                print(f"Error deleting {filename}: {str(e)}")