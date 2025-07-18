# Meesho Seller Genius

An AI-powered seller platform inspired by Meesho, built as a group project. Empowers local sellers to generate, refine, and translate product content, manage bulk listings, and optimize pricing with a modern, user-friendly interface.

---

## 🚀 Features

- **AI-Powered Content Generation**
  - Generate, refine, and translate product descriptions and social media captions in multiple languages using Llama-3 (Groq).
  - Custom AI prompts: Sellers can instruct the AI to rewrite or adjust content as they wish.
  - Inline AI refinement and real-time post preview.

- **Bulk Product Listing**
  - Upload and manage multiple products at once for efficient catalog management.

- **Dynamic Pricing**
  - AI-driven price suggestions based on demand, region, and festival data.
  - Visual tools for adjusting and applying price changes.

- **Multi-Language & Local Seller Support**
  - Translate content into Hindi, Tamil, Telugu, Bengali, Marathi, Kannada, Malayalam, Punjabi, Gujarati, and more.
  - All features designed to be effective for local sellers and regional markets.

- **Modern UI/UX**
  - Responsive design with React and Tailwind CSS.
  - Side-by-side form and post preview.
  - Dynamic language dropdown, inline popovers for custom AI prompts, and beautiful feedback animations.

- **Image Uploads**
  - Upload product images for use in listings and social media posts.

- **Authentication**
  - Secure user authentication with Firebase.

- **Other Highlights**
  - Real-time post preview with all hashtags always visible, regardless of language.
  - Sellers can add, edit, and refine hashtags at any time.
  - Group project with modular code, GitHub collaboration, and rapid feature iteration.

---

## 🏷️ Hashtag Handling

- **All hashtags you add in the product description or caption input will always appear in the post preview, regardless of the selected language.**
- When you translate or refine content using AI, only the main text is translated or rewritten—your hashtags remain as you entered them.
- You can add, edit, or remove hashtags at any time, and the preview will update instantly to reflect your changes.
- This ensures sellers have full control over their tags for better reach and discoverability on social media.

**Example:**  
If you enter:  
`Dazzle in style with our new saree! #Fashion #Saree #NewArrival #EthnicWear`  
and translate to Hindi, the preview will show:  
`(Hindi translation of main text) #Fashion #Saree #NewArrival #EthnicWear`

---

## 📸 Screenshots

<!-- Replace these with your actual screenshots -->
### Dashboard
![Dashboard Screenshot](screenshots/dashboard.png)

### Social Media Post Generator
![Social Media Post Screenshot](screenshots/social-post.png)

### Bulk Listing
![Bulk Listing Screenshot](screenshots/bulk-listing.png)

### Dynamic Pricing
![Dynamic Pricing Screenshot](screenshots/dynamic-pricing.png)

---

## 🛠️ Getting Started

### 1. Clone the Repository

```sh
git clone https://github.com/priyanka-singh3/Meesho-Seller-Genius.git
cd Meesho-Seller-Genius
```

### 2. Install Dependencies

#### Backend
```sh
cd backend
npm install
```

#### Frontend
```sh
cd ../frontend
npm install
```

### 3. Set Up Environment Variables

#### Backend (`backend/.env`)
```
GROQ_API_KEY=your_groq_api_key_here
FIREBASE_API_KEY=your_firebase_api_key_here
# Add any other required keys
```

#### Frontend (`frontend/.env`)
```
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key_here
# Add any other required keys
```

### 4. Run the Application

#### Start Backend
```sh
cd backend
npm start
```

#### Start Frontend
```sh
cd ../frontend
npm start
```

The app will be available at `http://localhost:3000` (backend) and `http://localhost:5173` (frontend, or as per your Vite config).

---

## 🤖 AI Model Integration

- This project uses [Groq](https://groq.com/) to access the Llama-3 model for all AI features.
- You need a valid `GROQ_API_KEY` to use the AI endpoints.
- All AI requests are made via the backend, so your key is never exposed to the frontend.

---

## 🧑‍💻 How to Use

1. **Sign up or log in** (Firebase authentication).
2. **Create or upload products** using the bulk listing tool.
3. **Generate and refine product descriptions and captions** using the AI tools.
4. **Translate content** into any supported language.
5. **Preview your post** in real time, with all hashtags always visible.
6. **Apply dynamic pricing** suggestions to optimize your catalog.
7. **Share or export your content** as needed.

---

## 👥 Team & Contributions

This project was built as a group project.  
Contributions, issues, and feature requests are welcome!

---

## 📄 License

[MIT](LICENSE)