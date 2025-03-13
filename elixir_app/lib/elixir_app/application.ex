defmodule ElixirApp.Application do
  use Application

  def start(_type, _args) do
    # Load env vars from .env file if present
    Dotenv.load()

    port = 
      System.get_env("PORT")
      |> case do
           nil -> "4000"
           p -> p
         end
      |> String.to_integer()

    children = [
      {Plug.Cowboy, scheme: :http, plug: ElixirApp.Router, options: [port: port]}
    ]

    opts = [strategy: :one_for_one, name: ElixirApp.Supervisor]
    Supervisor.start_link(children, opts)
  end
end 