import asyncio
import websockets
import json
import base64
import numpy as np
import cv2
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))
from ai_core import FitnessTracker

async def handle_client(websocket):
    tracker = FitnessTracker()
    print(f"Client connected: {websocket.remote_address}", flush=True)
    try:
        async for message in websocket:
            try:
                data = json.loads(message)
                mode = data.get('mode', 'SQUAT')
                frame_data = data.get('frame', '')

                if ',' in frame_data:
                    frame_data = frame_data.split(',')[1]

                img_bytes = base64.b64decode(frame_data)
                img_array = np.frombuffer(img_bytes, dtype=np.uint8)
                frame = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

                if frame is None:
                    await websocket.send(json.dumps({"reps": 0, "feedback": "Không đọc được frame", "timer": 0}))
                    continue

                result = tracker.process_frame(frame, mode)
                await websocket.send(json.dumps(result))

            except Exception as e:
                await websocket.send(json.dumps({"reps": 0, "feedback": f"Lỗi xử lý: {str(e)}", "timer": 0}))
    except websockets.exceptions.ConnectionClosedOK:
        pass
    finally:
        print(f"Client disconnected: {websocket.remote_address}", flush=True)

async def main():
    print("AI WebSocket Server running at ws://localhost:8765", flush=True)
    print("Press Ctrl+C to stop.", flush=True)
    async with websockets.serve(handle_client, "localhost", 8765):
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())
