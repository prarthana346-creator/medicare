import os
import sys

# Ensure backend directory is in python module search path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app import create_app
from app.extensions import db

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        # Ensure database tables are created
        db.create_all()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)

