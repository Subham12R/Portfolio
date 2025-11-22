# Subham Portfolio  
[subham12r.me]([https://www.subham12r.me/](http://subham12r.me/))

Welcome! I’m **Subham**, a second-year B.Tech Computer Science student at Adamas University, passionate about web development using React, Next.js and Node.js. My portfolio site showcases my projects, skills, and the journey I’m on in tech.

---

## 🔧 Tech Stack  
- **Frontend:** React, Vite, Tailwind CSS 4,  (with Montserrat & Manrope fonts)  
- **Backend:** Node.js (for server/API logic), Supabase (for data persistence)  
- **Authentication:** OAuth (for secure login flows)  
- **Chat Widget:** Elfsight chat widget for customer support
- **Deployment:** Netlify (for hosting the static frontend) and Render (for backend) 
- **Others:** Git & GitHub (version control and codebase), Responsive design (mobile-first)

---

## 🗂️ Features  
- Home / About section – introducing me, my skills, and my focus in web dev  
- Projects section – highlights of the projects I've built (with tech stack, links, screenshots)  
- Blog or Insights section (optional) – sharing my learnings, tutorials, and web dev experiences  
- Contact section – ways to connect (email, LinkedIn, GitHub)  
- Account / Auth page – demonstrating login/signup, profile photo, username/password change (planned or implemented)  
- Chat Widget – Interactive chat widget from Elfsight for visitor communication
- Clean UI with custom SCSS using company-branding colours and typography (Montserrat & Manrope)

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- Cloudinary account (for file uploads)

### Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/portfolio.git
   cd portfolio
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```
   
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   NODE_ENV=development
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   SUPABASE_JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   JWT_SECRET=your_jwt_secret
   ```
   
   Run the backend:
   ```bash
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   ```
   
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL=http://localhost:5000
   ```
   
   Run the frontend:
   ```bash
   npm run dev
   ```

For detailed setup instructions, see [Backend README](backend/README.md) and [Frontend README](frontend/README.md).

---

