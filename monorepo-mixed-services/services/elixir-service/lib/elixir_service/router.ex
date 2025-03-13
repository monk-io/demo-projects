defmodule ElixirService.Router do
  use Plug.Router

  plug :match
  plug :dispatch

  get "/" do
    send_resp(conn, 200, "Elixir service running and connected to Redis, MongoDB, and MySQL.")
  end

  match _ do
    send_resp(conn, 404, "Not found")
  end
end 