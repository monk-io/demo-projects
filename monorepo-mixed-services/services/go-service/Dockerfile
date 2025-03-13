# Use the official Go image to build the binary
FROM golang:1.18 as builder

WORKDIR /app

COPY go.mod .
COPY main.go .
RUN go mod download

RUN go build -o server .

# Use a minimal image for the binary
FROM alpine:3.16
RUN apk add --no-cache ca-certificates
WORKDIR /app
COPY --from=builder /app/server .

EXPOSE 8080

CMD ["./server"] 