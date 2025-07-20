import sys
import json
from dotenv import load_dotenv
import google.generativeai as genai

load__dotenv()

api_key= os.getenv("GEMINI_API_KEY")


genai.configure(api_key=api_key)
model = genai.GenerativeModel(model_name="gemini-2.5-flash")

try:
    # Read JSON input from stdin
    data = json.load(sys.stdin)
    
    # Debug: Print received data structure
    print(f"DEBUG: Received data keys: {list(data.keys())}", file=sys.stderr)
    
    # Handle both single product and CSV row data formats
    if 'csvRowData' in data:
        # CSV row format - extract actual product data
        product_data = data['csvRowData']
    else:
        # Direct product data format
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
    
    # Filter out empty values (excluding imageUrl from the description text)
    product_info = {k: v for k, v in product_details.items() if v and str(v).strip()}
    
    # Create detailed product description (excluding imageUrl from text description)
    product_description = []
    for key, value in product_info.items():
        if key == "imageUrl":
            continue  # Skip image URL in text description
        elif key == "mrp":
            product_description.append(f"MRP: ₹{value}")
        elif key == "sellingPrice":
            product_description.append(f"Selling Price: ₹{value}")
        elif key == "gst":
            product_description.append(f"GST: {value}%")
        elif key == "placeOfOrigin":
            product_description.append(f"Made in: {value}")
        elif key == "returnPolicy":
            product_description.append(f"Return Policy: {value}")
        elif key == "productType":
            product_description.append(f"Product Type: {value}")
        elif key == "sku":
            product_description.append(f"SKU: {value}")
        elif key == "subCategory":
            product_description.append(f"Sub-category: {value}")
        elif key == "gender":
            product_description.append(f"Gender: {value}")
        else:
            formatted_key = key.replace("_", " ").title()
            product_description.append(f"{formatted_key}: {value}")
    
    product_desc_text = "\n".join(product_description)
    
    # Ensure we have meaningful content
    if not product_desc_text.strip():
        raise ValueError("No meaningful product data found to generate copy")
    
    # Enhanced prompt for better e-commerce copy with hashtags and gender targeting
    prompt = f'''You are an expert e-commerce copywriter and social media marketer specializing in marketplace listings like Amazon, Flipkart, Myntra, and social media platforms. Based on the product details below, generate compelling copy that will attract customers and improve search rankings.

Generate ONLY the following sections in this exact format:

TITLE: [Create a compelling product title (5-8 words) that includes brand name, key features, gender (if mentioned) and appeals to target customers. Make it searchable and click-worthy]

TAGLINE: [Write a catchy marketing phrase (under 15 words) that highlights the main selling point or unique value proposition]

DESCRIPTION: [Write a persuasive product description (3-5 sentences) that focuses on benefits, quality, and what makes this product special. Include emotional appeal and practical benefits. Consider gender-specific language if applicable]

KEYWORDS: [List 10-12 relevant keywords/tags for SEO and searchability, separated by commas. Include product type, brand, features, price range, gender-specific terms, and related terms]

FEATURES: [List 4-6 key product features as bullet points, each on a new line starting with "•". Focus on what customers care about most - quality, durability, style, functionality]

HASHTAGS: [Generate 15-20 relevant hashtags for social media marketing, separated by spaces. Include brand hashtags, product category hashtags, lifestyle hashtags, gender-specific hashtags (if applicable), and trending hashtags. Make them Instagram and Facebook friendly]

Product Details:
{product_desc_text}

Make the copy engaging, professional, and optimized for online marketplace success and social media visibility. Focus on what makes customers want to buy this product and share it on social media. If gender is specified, tailor the language and hashtags accordingly.'''

    print(f"DEBUG: Sending prompt to Gemini", file=sys.stderr)
    
    response = model.generate_content(prompt)
    
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
    
    # Parse the response
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
        elif current_section == "features" and line:
            if output["features"]:
                output["features"] += "\n"
            output["features"] += line
    
    # If parsing fails, try to extract from raw text with better fallback
    if not output["title"] and not output["description"]:
        # Fallback parsing - try different delimiters
        sections = response_text.split('\n\n')
        for section in sections:
            if 'TITLE:' in section:
                output["title"] = section.replace('TITLE:', '').strip()
            elif 'DESCRIPTION:' in section:
                output["description"] = section.replace('DESCRIPTION:', '').strip()
            elif 'TAGLINE:' in section:
                output["tagline"] = section.replace('TAGLINE:', '').strip()
            elif 'KEYWORDS:' in section:
                output["keywords"] = section.replace('KEYWORDS:', '').strip()
            elif 'HASHTAGS:' in section:
                output["hashtags"] = section.replace('HASHTAGS:', '').strip()
            elif 'FEATURES:' in section:
                output["features"] = section.replace('FEATURES:', '').strip()
    
    # Ensure we have at least basic content
    if not output["title"]:
        gender_prefix = f"{product_info.get('gender', '')} " if product_info.get('gender') else ""
        brand_part = product_info.get('brand', '')
        product_part = product_info.get('productType', '')
        color_part = product_info.get('color', '')
        
        title_parts = [gender_prefix.strip(), brand_part, product_part, color_part]
        title_parts = [part for part in title_parts if part]
        output["title"] = " ".join(title_parts) if title_parts else "Premium Quality Product"
    
    if not output["description"]:
        gender_text = f" for {product_info.get('gender', 'everyone').lower()}" if product_info.get('gender') else ""
        brand_text = product_info.get('brand', 'our brand')
        product_type = product_info.get('productType', 'product')
        output["description"] = f"High-quality {product_type} from {brand_text}{gender_text} with excellent features and great value."
    
    if not output["hashtags"]:
        # Generate basic hashtags if none were created
        brand = product_info.get('brand', '').replace(' ', '').lower()
        product_type = product_info.get('productType', '').replace(' ', '').lower()
        category = product_info.get('category', '').replace(' ', '').lower()
        gender = product_info.get('gender', '').lower()
        
        basic_hashtags = [
            f"#{brand}" if brand else "",
            f"#{product_type}" if product_type else "",
            f"#{category}" if category else "",
            f"#{gender}" if gender else "",
            f"#{gender}fashion" if gender else "",
            "#fashion", "#style", "#shopping", "#quality", "#trendy", "#lifestyle"
        ]
        output["hashtags"] = " ".join([tag for tag in basic_hashtags if tag])
    
    # Clean up hashtags - ensure they start with # and are space-separated
    if output["hashtags"]:
        hashtags = output["hashtags"].split()
        cleaned_hashtags = []
        for tag in hashtags:
            tag = tag.strip()
            if tag and not tag.startswith('#'):
                tag = '#' + tag
            if tag:
                cleaned_hashtags.append(tag)
        output["hashtags"] = " ".join(cleaned_hashtags)
    
    # Output as JSON
    print(json.dumps(output, indent=2))

except Exception as e:
    print(f"ERROR: {str(e)}", file=sys.stderr)
    
    # Try to get basic product info even in error case
    try:
        data = json.load(sys.stdin) if 'data' not in locals() else data
        product_data = data.get('csvRowData', data)
        
        brand = str(product_data.get('brand', product_data.get('Brand', ''))).strip()
        product_type = str(product_data.get('productType', product_data.get('Product Type', ''))).strip()
        gender = str(product_data.get('gender', product_data.get('Gender', ''))).strip()
        
        basic_hashtags = [
            f"#{brand.replace(' ', '').lower()}" if brand else "#quality",
            f"#{product_type.replace(' ', '').lower()}" if product_type else "#product",
            f"#{gender.lower()}" if gender else "",
            f"#{gender.lower()}fashion" if gender else "",
            "#fashion", "#style", "#shopping", "#trendy", "#lifestyle"
        ]
        
        error_output = {
            "error": str(e),
            "title": f"{gender} {brand} {product_type}".strip() if any([gender, brand, product_type]) else "Premium Quality Product",
            "tagline": "Premium Quality Product",
            "description": "High-quality product with excellent features and great value for money.",
            "keywords": "quality, premium, durable, stylish, comfortable, trendy",
            "features": "• High-quality materials\n• Great value for money\n• Reliable performance\n• Stylish design",
            "hashtags": " ".join([tag for tag in basic_hashtags if tag]),
            "imageUrl": product_data.get("imageUrl", ""),
            "productInfo": {
                "brand": brand,
                "category": str(product_data.get("category", product_data.get("Category", ""))).strip(),
                "gender": gender,
                "price": str(product_data.get("sellingPrice", product_data.get("Selling Price", product_data.get("mrp", product_data.get("MRP", ""))))).strip(),
                "sku": str(product_data.get("sku", product_data.get("SKU", ""))).strip()
            }
        }
    except:
        # Ultimate fallback
        error_output = {
            "error": str(e),
            "title": "Premium Quality Product",
            "tagline": "Premium Quality Product",
            "description": "High-quality product with excellent features and great value for money.",
            "keywords": "quality, premium, durable, stylish, comfortable, trendy",
            "features": "• High-quality materials\n• Great value for money\n• Reliable performance\n• Stylish design",
            "hashtags": "#quality #premium #style #fashion #trendy #lifestyle",
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
