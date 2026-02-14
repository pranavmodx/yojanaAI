#!/bin/bash
echo "Starting YojanaAI..."

# Function to kill processes on exit
cleanup() {
    echo "Stopping YojanaAI..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

# Trap SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM

# Start Backend
echo "Starting Backend..."
cd backend
source venv/bin/activate
# Run in background
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# Start Frontend
echo "Starting Frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "YojanaAI is running!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo "Press CTRL+C to stop."

# Wait for process
wait $BACKEND_PID $FRONTEND_PID
