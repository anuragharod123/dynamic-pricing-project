FROM public.ecr.aws/lambda/python:3.12

COPY requirements.txt ${LAMBDA_TASK_ROOT}/requirements.txt

RUN pip install -r ${LAMBDA_TASK_ROOT}/requirements.txt \
    --target ${LAMBDA_TASK_ROOT}

COPY app ${LAMBDA_TASK_ROOT}/app
COPY agent ${LAMBDA_TASK_ROOT}/agent

CMD ["app.main.handler"]