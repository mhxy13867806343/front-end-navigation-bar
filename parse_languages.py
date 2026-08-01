import yaml
import json
import sys
import os

file_path = '/Users/hooksvue/Desktop/front-end-navigation-bar/languages.yml'
output_file_path = '/Users/hooksvue/Desktop/front-end-navigation-bar/parsed_languages.json'
languages_data = {}

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        data = yaml.safe_load(f)

    for lang_name, lang_info in data.items():
        # Only process if it's a programming language and has extensions
        if lang_info and lang_info.get('type') == 'programming' and 'extensions' in lang_info and lang_info['extensions']:
            extension = lang_info['extensions'][0]
            languages_data[lang_name] = {'extension': extension}
        # Also consider markup languages if they have extensions
        elif lang_info and lang_info.get('type') == 'markup' and 'extensions' in lang_info and lang_info['extensions']:
            extension = lang_info['extensions'][0]
            languages_data[lang_name] = {'extension': extension}

    with open(output_file_path, 'w', encoding='utf-8') as outfile:
        json.dump(languages_data, outfile, ensure_ascii=False, indent=2)

    print(f"Parsed languages written to {output_file_path}")

except FileNotFoundError:
    print(json.dumps({"error": f"File not found: {file_path}"}))
except yaml.YAMLError as e:
    print(json.dumps({"error": f"Error parsing YAML: {e}"}))
except Exception as e:
    print(json.dumps({"error": f"An unexpected error occurred: {e}"}))