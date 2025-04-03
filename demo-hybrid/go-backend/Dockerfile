#
# server-builder (CGO is required)
#

FROM golang:alpine as server-builder

ENV CGO_ENABLED=1
RUN apk add build-base

WORKDIR /app

COPY . /app

RUN go build -buildvcs=false -mod=readonly -v

#
# deploy
#

FROM alpine as deployment

WORKDIR /app

COPY db /app/db
COPY --from=server-builder /app/main /app

EXPOSE 8080

CMD ./main -docker
