from html import escape

def escape_html(obj):
    if isinstance(obj, str):
        return escape(obj)
    elif isinstance(obj, dict):
        return {key: escape_html(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [escape_html(element) for element in obj]
    return obj