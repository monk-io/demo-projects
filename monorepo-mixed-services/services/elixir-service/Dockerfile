FROM elixir:1.12-alpine
WORKDIR /app
COPY mix.exs ./
RUN mix local.hex --force && mix deps.get
COPY . .
RUN mix compile
EXPOSE 4000
CMD ["mix", "run", "--no-halt"] 