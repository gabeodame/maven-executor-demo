# **Maven Executor Demo🚀**  

*A Web-based Tool for Running Maven Commands & Managing Java Projects*

## **📌 Overview**

Maven Executor is a **full-stack application** designed to execute **Maven lifecycle commands** (`clean`, `compile`, `package`, `test`) via a **Node.js backend**, while providing **real-time logs and artifact management** in a **React + Next.js frontend**.

It simplifies **Java project builds, CI/CD workflows, and artifact management**, making it useful for **developers, DevOps teams, and CI/CD pipelines**.

---

## **🌟 Features**

✅ Execute **Maven commands** directly from the browser  
✅ **Real-time logs** with color-coded output for easy debugging  
✅ **WebSocket-based** live log streaming for seamless execution feedback  
✅ **Multi-session support** (run builds as a guest or authenticate via GitHub)  
✅ **Artifact Explorer** to browse build artifacts and download files  
✅ **Project Management** – Switch between multiple Java projects  
✅ **Optimized for CI/CD** – Can be integrated with Jenkins, GitHub Actions, and other tools  

---

## **🌍 Live Demo**

Try it now: **[Maven Executor Live Demo 🚀](https://maven-executor-demo.vercel.app/)**

![Maven Executor Demo](assets/demo_screenshot.png)

---

## **🛠️ Tech Stack**

### **Frontend**  

- ⚛️ **React.js** (with Next.js) – Interactive UI & SSR  
- 🎨 **Tailwind CSS** – Modern, responsive styling  
- 🔌 **WebSockets** – Real-time log streaming  

### **Backend**  

- 🖥️ **Node.js + Express.js** – API and command execution  
- ⚙️ **Dockerized Setup** – Containerized for scalability  
- 🔄 **Maven CLI** – Executes Maven commands in isolated workspaces  

---

## **🚀 Installation & Setup**

### **1️⃣ Clone the Repository**

```sh
git clone https://github.com/gabeodame/maven-executor-demo.git
cd maven-executor-demo
```

---

### **2️⃣ Backend Setup**

#### **Option 1: Run Locally**

```sh
cd backend-node
npm install
npm run dev
```

#### **Option 2: Run with Docker**

```sh
cd backend-node
docker-compose up --build
```

---

### **3️⃣ Frontend Setup**

```sh
cd frontend-react
npm install
npm run dev
```

---

### **4️⃣ Access the Application**

- Open **<http://localhost:3000/>** for the frontend.
- The backend runs on **<http://localhost:5001/>**.

---

## **🔧 Environment Variables**

Create a `.env` file in the backend and frontend directories and configure the following:

### **Backend (`backend-node/.env`)**

```env
PORT=5001
NODE_ENV=development
NEXT_PUBLIC_VITE_API_URL=http://localhost:5001
```

### **Frontend (`frontend-react/.env.local`)**

```env
NEXT_PUBLIC_VITE_API_URL=http://localhost:5001
```

---

## **🛠️ Usage**

### **Running a Maven Command**

1. Select a project or continue as a guest.
2. Type a Maven command (`mvn clean install` or `mvn test`).
3. Click "Run" and monitor logs in real-time.

### **Downloading Artifacts**

- Navigate to the **Artifacts Explorer**.
- Expand project folders and download built `.jar` or compiled files.

---

## **🚀 Deployment**

### **Deploy to Vercel (Frontend)**

1. Install the Vercel CLI:

   ```sh
   npm install -g vercel
   ```

2. Run:

   ```sh
   vercel
   ```

### **Deploy to AWS / DigitalOcean**

For a production setup, use **Docker & Kubernetes** to deploy the backend, and **Vercel or a CDN** for the frontend.

---

## **🔹 Use Cases**

✅ **Developers** – Quickly build and test Maven projects  
✅ **CI/CD Pipelines** – Automate builds in **Jenkins, GitHub Actions, or GitLab CI**  
✅ **DevOps Teams** – Monitor logs and artifacts from remote builds  
✅ **Learning Maven** – Interactive tool for exploring Maven commands  

---

## **🤝 Contributing**

Contributions are welcome! Please follow these steps:

1. Fork the repository 🍴
2. Create a new branch: `git checkout -b feature-branch`
3. Commit changes: `git commit -m "Added new feature"`
4. Push changes: `git push origin feature-branch`
5. Open a Pull Request 🎉

---

## **📜 License**

This project is licensed under the **MIT License**.

---

## **📞 Support**

For any issues, please [open a GitHub issue](https://github.com/gabeodame/maven-executor-demo/issues). 🚀
