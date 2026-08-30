from typing import Optional

def quick_qr(image_bytes: bytes) -> Optional[str]:
    import numpy as np
    from pyzbar import pyzbar as pz
    arr = np.frombuffer(image_bytes, np.uint8)
    import cv2
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    for obj in pz.decode(img):
        if obj.type == "QRCODE":
            return obj.data.decode().strip()
    return None