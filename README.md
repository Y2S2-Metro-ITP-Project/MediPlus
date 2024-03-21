# MediPlus: Hospital Management System using MERN Stack

MediPlus is a comprehensive Hospital Management System built using the MERN stack (MongoDB, Express.js, React.js, Node.js). This system is designed to streamline various operations within a hospital, including patient management, appointment scheduling, staff management, inventory management, billing, and more.

## Installation

Follow these steps to set up MediPlus on your local machine:

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js: Download and install Node.js from [nodejs.org](https://nodejs.org/).
- MongoDB: Install MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community).

### Steps

1. **Clone the repository:**

    ```bash
    git clone https://github.com/your_username/MediPlus.git
    ```

2. **Navigate to the project directory:**

    ```bash
    cd MediPlus
    ```

3. **Install dependencies for both frontend and backend:**

    ```bash
    cd client && npm install
    cd ../server && npm install
    ```

4. **Set up environment variables:**

    - Create a `.env` file in the `server` directory.
    - Define the following variables:

        ```
        PORT=5000
        MONGODB_URI=your_mongodb_uri
        JWT_SECRET=your_jwt_secret
        ```

5. **Start the backend server:**

    ```bash
    cd ../server && npm start
    ```

6. **Start the frontend development server:**

    ```bash
    cd ../client && npm start
    ```

7. **Access the application:**

    Open your web browser and navigate to `http://localhost:5173`.

## Contributors

- [Your Name](https://github.com/your_username)
- [Contributor 1](https://github.com/contributor1_username)
- [Contributor 2](https://github.com/contributor2_username)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Hat tip to anyone whose code was used
- Inspiration
- etc.

## Additional Notes
