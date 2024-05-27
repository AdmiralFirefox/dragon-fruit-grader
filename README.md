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

Run the project locally
```bash
npm run dev
```

<br />

## Running on Docker

### Building the Docker Image

The `"scripts"` of `package.json` is set-up to build locally to concurrently run the Next JS and Flask development mode with the `npm run` and `python -m` command. But, it is not the case for docker since both the Next JS and Flask have their own seperate images. So, change the `"scripts"` of your `package.json` to this:
```JSON
"scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
},
```

<br />

When running `docker compose build`, sometimes there will be an error in installing dependencies, so change the contents of the `requirements.txt` to the following:
```bash
flask 
flask-cors
--extra-index-url https://download.pytorch.org/whl/cpu
ultralytics
```

<br />

### Running Next JS on Development and Production mode

Add this to `next.Dockerfile`
```Docker
FROM base AS dev

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
```

<br />

Comment out the `ENV NODE_ENV production` and put the `ENV NODE_ENV development`
```Docker
# ENV NODE_ENV production
ENV NODE_ENV development
```

<br />

Add the following to the `docker-compose.yml`

```yaml
#nextjs service
nextapp:
    container_name: nextapp
    image: dragonfruit-grader/nextapp:1.0.0
    build:
        context: .
        dockerfile: dockerfiles/next.Dockerfile
        target: dev
    restart: always
    command: npm run dev
    environment:
        - NODE_ENV=development
        - WATCHPACK_POLLING=true
    volumes:
        - .:/app
        - /app/node_modules
        - /app/.next
    ports:
        - 3000:3000
    depends_on:
        - flaskapp
```

<br />

### Running Flask on Development and Production mode

Add the following `volumes` in your `docker-compose.yml`

```yaml
build:
    context: .
    dockerfile: dockerfiles/flask.Dockerfile
volumes:
    - ./api:/app
ports:
    - 8000:8000
```

<br />

Add `ENV FLASK_ENV=development` on your `flask.Dockerfile`

```Docker
ENV FLASK_ENV=development 
```

<br />

Also, add the `"--reload"`

```Docker
CMD [ "flask", "run", "--host=0.0.0.0", "--port=8000", "--reload"]
```

<br />

Run docker
```bash
docker compose up --build
```


