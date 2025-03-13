defmodule ElixirApp.Router do
  use Plug.Router

  plug :match
  plug :dispatch

  get "/info" do
    send_resp(conn, 200, "ElixirApp running")
  end

  match _ do
    send_resp(conn, 404, "Oops!")
  end
end 