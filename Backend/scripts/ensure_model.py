#!/usr/bin/env python3
"""Ensure nomeroff-net package is installed and model weights are downloaded/cached.
This script is idempotent and safe to run at container start.
"""
import os
import subprocess
import sys
from pathlib import Path

MODELS_DIR = Path(os.environ.get('NOMEROFF_MODELS_DIR', '/app/models'))
MARKER = MODELS_DIR / '.nomeroff_ready'

def pip_install_nomeroff():
    print('Installing nomeroff-net from GitHub...')
    cmd = [sys.executable, '-m', 'pip', 'install', '--no-cache-dir', 'nomeroff-net@git+https://github.com/ria-com/nomeroff-net.git']
    try:
        subprocess.check_call(cmd)
        return True
    except Exception as e:
        print('pip install failed:', e)
        return False

def ensure_package_and_models():
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    if MARKER.exists():
        print('Model marker found; skipping download.')
        return True

    try:
        # Try to import and initialize the pipeline — some packages auto-download weights
        print('Trying to import nomeroff_net and initialize pipeline...')
        from nomeroff_net import pipeline
        from nomeroff_net.tools import unzip
        p = pipeline('number_plate_detection_and_reading', image_loader='opencv')
        # If pipeline constructed successfully, assume weights are present or downloaded
        MARKER.write_text('ready')
        print('nomeroff pipeline initialized successfully.')
        return True
    except Exception as e:
        print('nomeroff import or pipeline init failed:', e)

    # Try to install package and retry
    if not pip_install_nomeroff():
        print('Failed to install nomeroff-net. Exiting with error.')
        return False

    try:
        from nomeroff_net import pipeline
        from nomeroff_net.tools import unzip
        p = pipeline('number_plate_detection_and_reading', image_loader='opencv')
        MARKER.write_text('ready')
        print('nomeroff pipeline initialized after install.')
        return True
    except Exception as e:
        print('Failed to initialize nomeroff after install:', e)
        return False

if __name__ == '__main__':
    ok = ensure_package_and_models()
    if not ok:
        print('ensure_model: failed')
        sys.exit(1)
    print('ensure_model: done')
    sys.exit(0)
