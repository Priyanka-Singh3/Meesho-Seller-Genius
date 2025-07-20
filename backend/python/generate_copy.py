import sys
import os  # ✅ Added missing import
import json
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()  # ✅ Fixed typo

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:  # ✅ Added API key validation
    print("ERROR: GEMINI_API_KEY not found in environment", file=sys.stderr)
    sys.exit(1)

genai.configure(api_key=api_key)
model = genai.GenerativeModel(model_name="gemini-1.5-flash")  # ✅ Updated model name

# ✅ Read input data once at the beginning
try:
    raw_input = sys.stdin.read()
    data = json.loads(raw_input)
except json.JSONDecodeError as e:
    print(f"ERROR: Invalid JSON input: {str(e)}", file=sys.stderr)
    sys.exit(1)

try:
    # Debug: Print received data structure
    print(f"DEBUG: Received data keys: {list(data.keys())}", file=sys.stderr)
    
    # Handle both single product and CSV row data formats
    if 'csvRowData' in data:
        product_data = data['csvRowData']
    else:
        product_data = data
    
    # Build comprehensive product description using all available fields
    product_details = {}
    
    # Map common CSV column names to expected fields
    field_mapping = {
        'Brand': 'brand',
        'brand': 'brand',
        'Category': 'category', 
        'category': 'category',
        'Sub Category': 'subCategory',
        'subCategory': 'subCategory',
        'Product Type': 'productType',
        'productType': 'productType',
        'SKU': 'sku',
        'sku': 'sku',
        'MRP': 'mrp',
        'mrp': 'mrp',
        'Selling Price': 'sellingPrice',
        'sellingPrice': 'sellingPrice',
        'GST': 'gst',
        'gst': 'gst',
        'Size': 'size',
        'size': 'size',
        'Color': 'color',
        'color': 'color',
        'Material': 'material',
        'material': 'material',
        'Pattern': 'pattern',
        'pattern': 'pattern',
        'Place of Origin': 'placeOfOrigin',
        'placeOfOrigin': 'placeOfOrigin',
        'Return Policy': 'returnPolicy',
        'returnPolicy': 'returnPolicy',
        'Gender': 'gender',
        'gender': 'gender',
        'Image URL': 'imageUrl',
        'imageUrl': 'imageUrl',
        'image': 'imageUrl',
        'Image': 'imageUrl'
    }
    
    # Extract and normalize product data
    for key, value in product_data.items():
        if key in field_mapping:
            normalized_key = field_mapping[key]
            if value and str(value).strip():
                product_details[normalized_key] = str(value).strip()
        else:
            # Keep unknown fields as-is for additional context
            if value and str(value).strip() and key not in ['id', 'backgroundColor', 'processed', 'copyGenerated', 'processedImageUrl', 'generatedCopy', 'originalImageUrl']:
                product_details[key] = str(value).strip()
    
    print(f"DEBUG: Normalized product details: {product_details}", file=sys.stderr)
    
    # Filter out empty values
    product_info = {k: v for k, v in product_details.items() if v and str(v).strip()}
    
    # Create concise product description
    key_details = []
    if product_info.get('brand'):
        key_details.append(f"Brand: {product_info['brand']}")
    if product_info.get('productType'):
        key_details.append(f"Type: {product_info['productType']}")
    if product_info.get('category'):
        key_details.append(f"Category: {product_info['category']}")
    if product_info.get('gender'):
        key_details.append(f"Gender: {product_info['gender']}")
    if product_info.get('color'):
        key_details.append(f"Color: {product_info['color']}")
    if product_info.get('size'):
        key_details.append(f"Size: {product_info['size']}")
    if product_info.get('material'):
        key_details.append(f"Material: {product_info['material']}")
    if product_info.get('sellingPrice'):
        key_details.append(f"Price: ₹{product_info['sellingPrice']}")
    elif product_info.get('mrp'):
        key_details.append(f"MRP: ₹{product_info['mrp']}")
    
    product_desc_text = "\n".join(key_details)
    
    # Ensure we have meaningful content
    if not product_desc_text.strip():
        raise ValueError("No meaningful product data found to generate copy")
    
    # ✅ Simplified and more focused prompt
    prompt = f'''Create marketing copy for this product. Respond with EXACTLY this format:

TITLE: [5-8 word compelling product title with brand and key feature]
TAGLINE: [Short catchy phrase under 15 words]
DESCRIPTION: [2-3 sentence persuasive description highlighting benefits]
KEYWORDS: [8-10 SEO keywords separated by commas]
FEATURES: [4 bullet points starting with "•"]
HASHTAGS: [15 hashtags for social media separated by spaces]

Product Information:
{product_desc_text}

Keep it professional, engaging, and optimized for e-commerce platforms.'''

    print(f"DEBUG: Sending prompt to Gemini", file=sys.stderr)
    
    # ✅ Add generation config for better consistency
    generation_config = {
        "temperature": 0.7,
        "top_p": 0.8,
        "top_k": 40,
        "max_output_tokens": 1024,
    }
    
    response = model.generate_content(prompt, generation_config=generation_config)
    
    if not response.text:
        raise ValueError("Empty response from Gemini")
    
    # Parse the response to extract different sections
    response_text = response.text.strip()
    
    print(f"DEBUG: Received response: {response_text[:200]}...", file=sys.stderr)
    
    # Create a structured JSON output
    output = {
        "title": "",
        "tagline": "",
        "description": "",
        "keywords": "",
        "features": "",
        "hashtags": "",
        "imageUrl": product_info.get("imageUrl", ""),
        "productInfo": {
            "brand": product_info.get("brand", ""),
            "category": product_info.get("category", ""),
            "gender": product_info.get("gender", ""),
            "price": product_info.get("sellingPrice", product_info.get("mrp", "")),
            "sku": product_info.get("sku", "")
        }
    }
    
    # ✅ Improved parsing with better error handling
    lines = response_text.split('\n')
    current_section = None
    
    for line in lines:
        line = line.strip()
        if line.startswith('TITLE:'):
            output["title"] = line.replace('TITLE:', '').strip()
        elif line.startswith('TAGLINE:'):
            output["tagline"] = line.replace('TAGLINE:', '').strip()
        elif line.startswith('DESCRIPTION:'):
            output["description"] = line.replace('DESCRIPTION:', '').strip()
        elif line.startswith('KEYWORDS:'):
            output["keywords"] = line.replace('KEYWORDS:', '').strip()
        elif line.startswith('HASHTAGS:'):
            output["hashtags"] = line.replace('HASHTAGS:', '').strip()
        elif line.startswith('FEATURES:'):
            current_section = "features"
            output["features"] = ""
        elif current_section == "features" and line.startswith('•'):
            if output["features"]:
                output["features"] += "\n"
            output["features"] += line
        elif line.startswith('•') and not current_section:
            # Handle case where FEATURES: header is missing
            if not output["features"]:
                output["features"] = line
            else:
                output["features"] += "\n" + line
    
    # ✅ Better fallback logic
    if not output["title"]:
        gender_prefix = f"{product_info.get('gender', '')} " if product_info.get('gender') else ""
        brand_part = product_info.get('brand', '')
        product_part = product_info.get('productType', '')
        color_part = product_info.get('color', '')
        
        title_parts = [gender_prefix.strip(), brand_part, product_part, color_part]
        title_parts = [part for part in title_parts if part]
        output["title"] = " ".join(title_parts)[:50] if title_parts else "Premium Quality Product"
    
    if not output["description"]:
        gender_text = f" for {product_info.get('gender', 'everyone').lower()}" if product_info.get('gender') else ""
        brand_text = product_info.get('brand', 'our brand')
        product_type = product_info.get('productType', 'product')
        output["description"] = f"High-quality {product_type} from {brand_text}{gender_text} with excellent features and great value."
    
    if not output["hashtags"]:
        # Generate basic hashtags
        brand = product_info.get('brand', '').replace(' ', '').lower()
        product_type = product_info.get('productType', '').replace(' ', '').lower()
        category = product_info.get('category', '').replace(' ', '').lower()
        gender = product_info.get('gender', '').lower()
        
        basic_hashtags = [
            f"#{brand}" if brand else "",
            f"#{product_type}" if product_type else "",
            f"#{category}" if category else "",
            f"#{gender}" if gender else "",
            "#fashion", "#style", "#shopping", "#quality", "#trendy", "#lifestyle"
        ]
        output["hashtags"] = " ".join([tag for tag in basic_hashtags if tag])
    
    # Clean up hashtags
    if output["hashtags"]:
        hashtags = output["hashtags"].split()
        cleaned_hashtags = []
        for tag in hashtags:
            tag = tag.strip()
            if tag and not tag.startswith('#'):
                tag = '#' + tag
            if tag and len(tag) > 1:
                cleaned_hashtags.append(tag)
        output["hashtags"] = " ".join(cleaned_hashtags)
    
    # Output as JSON
    print(json.dumps(output, indent=2))

except Exception as e:
    print(f"ERROR: {str(e)}", file=sys.stderr)
    
    # ✅ Simplified error fallback that doesn't try to re-read stdin
    error_output = {
        "error": str(e),
        "title": "Premium Quality Product",
        "tagline": "Excellence in Every Detail",
        "description": "High-quality product with excellent features and great value for money.",
        "keywords": "quality, premium, durable, stylish, comfortable, trendy",
        "features": "• High-quality materials\n• Great value for money\n• Reliable performance\n• Stylish design",
        "hashtags": "#quality #premium #style #fashion #trendy #lifestyle #shopping #value",
        "imageUrl": "",
        "productInfo": {
            "brand": "",
            "category": "",
            "gender": "",
            "price": "",
            "sku": ""
        }
    }
    
    print(json.dumps(error_output, indent=2))
    sys.exit(1)