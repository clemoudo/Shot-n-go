FROM python:3.12-alpine

RUN apk update && apk add --no-cache \
    curl \
    gcc \
    musl-dev \
    libffi-dev \
    openssl-dev \
    python3-dev \
    build-base

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt

RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r /code/requirements.txt

COPY ./app /code/app

COPY entrypoint-secrets.sh /entrypoint-secrets.sh
RUN chmod +X /entrypoint-secrets.sh
ENTRYPOINT [ "entrypoint-secrets.sh" ]

EXPOSE 5000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5000"]
