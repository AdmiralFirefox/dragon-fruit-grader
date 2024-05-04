# Dragon Fruit Grader

- A dragon fruit grader thesis project

<br />

## Building the Project

Clone the project
```bash
git clone https://github.com/AdmiralFirefox/dragonfruit-grader.git
```

<br />

Create virtual environment
```bash
# For Windows
python -m venv my-env

# For Linux
python3 -m venv my-env
```

<br />

Activate environment
```bash
# For Windows
my-env/Scripts/activate

# For Linux
source my-env/bin/activate
```

<br />

Install required dependencies in the `requirements.txt`
```bash
# For Windows
pip install -r requirements.txt

# For Linux
pip3 install -r requirements.txt
```

<br />

Go to `package.json` and change the `"flask-dev"` under `"scripts"` accordingly

**For Windows**
```JSON
"scripts": {
    "flask-dev": "pip install -r requirements.txt && python -m flask --app api/index run -p 8000 --reload",
```

**For Linux**
```JSON
"scripts": {
    "flask-dev": "FLASK_DEBUG=1 pip3 install -r requirements.txt && python3 -m flask --app api/index run -p 8000 --reload",
```

<br />

Run the project
```bash
npm run dev
```

