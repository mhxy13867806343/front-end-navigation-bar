
import os
import json
import re

def get_hello_world_content(language, extension):
    if language == "Python":
        return "print(\"Hello, World!\")"
    elif language == "JavaScript":
        return "console.log(\"Hello, World!\");"
    elif language == "Java":
        return "public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, World!\");\n    }\n}"
    elif language == "C":
        return "#include <stdio.h>\n\nint main() {\n    printf(\"Hello, World!\\n\");\n    return 0;\n}"
    elif language == "C++":
        return "#include <iostream>\n\nint main() {\n    std::cout << \"Hello, World!\" << std::endl;\n    return 0;\n}"
    elif language == "C#":
        return "using System;\n\npublic class HelloWorld {\n    public static void Main(string[] args) {\n        Console.WriteLine(\"Hello, World!\");\n    }\n}"
    elif language == "Go":
        return "package main\n\nimport \"fmt\"\n\nfunc main() {\n    fmt.Println(\"Hello, World!\")\n}"
    elif language == "Ruby":
        return "puts \"Hello, World!\""
    elif language == "PHP":
        return "<?php\n\necho \"Hello, World!\\n\";\n\n?>"
    elif language == "Swift":
        return "print(\"Hello, World!\")"
    elif language == "Kotlin":
        return "fun main() {\n    println(\"Hello, World!\")\n}"
    elif language == "Rust":
        return "fn main() {\n    println!(\"Hello, World!\");\n}"
    elif language == "HTML":
        return "<!DOCTYPE html>\n<html>\n<head>\n    <title>Hello World</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>"
    elif language == "CSS":
        return "/* Hello World CSS */\nbody {\n    background-color: lightblue;\n    text-align: center;\n}"
    elif language == "TypeScript":
        return "console.log(\"Hello, World!\");"
    elif language == "Shell":
        return "#!/bin/bash\n\necho \"Hello, World!\""
    else:
        return f"// This is a Hello World placeholder for {language} with extension {extension}"

def main():
    base_path = "/Users/hooksvue/Desktop/front-end-navigation-bar"
    parsed_languages_path = os.path.join(base_path, "parsed_languages.json")
    code_dir = os.path.join(base_path, "code")

    if not os.path.exists(code_dir):
        os.makedirs(code_dir)

    with open(parsed_languages_path, 'r') as f:
        languages_data = json.load(f)

    folder_count = 0
    file_count = 0

    for language_name, details in languages_data.items():
        # Sanitize language name to be a valid directory name
        sanitized_language_name = re.sub(r'[^a-zA-Z0-9_\-]+', '', language_name.replace(' ', '_'))
        
        if not sanitized_language_name:
            print(f"Skipping language '{language_name}' due to invalid directory name.")
            continue

        lang_folder_path = os.path.join(code_dir, sanitized_language_name)
        if not os.path.exists(lang_folder_path):
            os.makedirs(lang_folder_path)
            folder_count += 1

        extension = details.get("extension")
        if extension:
            file_name = f"hello_world{extension}"
            file_path = os.path.join(lang_folder_path, file_name)
            content = get_hello_world_content(language_name, extension)
            with open(file_path, 'w') as f:
                f.write(content)
            file_count += 1
        else:
            print(f"Language '{language_name}' has no primary extension. Skipping file creation.")

    print(f"Folders created: {folder_count}")
    print(f"Files created: {file_count}")

if __name__ == "__main__":
    main()
