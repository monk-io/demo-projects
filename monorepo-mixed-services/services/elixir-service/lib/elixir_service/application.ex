defmodule ElixirService.Application do
  use Application

  def start(_type, _args) do
    redis_url = System.get_env("REDIS_URL") || "redis://localhost:6379"
    mongo_url = System.get_env("MONGO_URL") || "mongodb://localhost:27017"
    mysql_url = System.get_env("MYSQL_URL") || "mysql://root:example@localhost:3306/testdb"

    # Start connections (the Mongo connection here is simulated)
    children = [
      {Redix, name: :redix, url: redis_url},
      {Task, fn -> connect_mongo(mongo_url) end},
      {MyXQL, [hostname: parse_hostname(mysql_url), username: parse_username(mysql_url),
               password: parse_password(mysql_url), database: parse_database(mysql_url),
               port: parse_port(mysql_url)]}
    ]

    opts = [strategy: :one_for_one, name: ElixirService.Supervisor]
    Supervisor.start_link(children, opts)

    # Start the web server
    port = 4000
    {:ok, _} = Plug.Cowboy.http(ElixirService.Router, [], port: port)
    IO.puts("Elixir service running on port #{port}")
    :ignore
  end

  defp connect_mongo(mongo_url) do
    IO.puts("Connecting to MongoDB at #{mongo_url}")
    :ok
  end

  defp parse_hostname(mysql_url) do
    [_, host_port] = String.split(mysql_url, "@")
    [host | _] = String.split(host_port, ":")
    host
  end

  defp parse_username(mysql_url) do
    [_, rest] = String.split(mysql_url, "://")
    [user | _] = String.split(rest, ":")
    user
  end

  defp parse_password(mysql_url) do
    parts = String.split(mysql_url, ":")
    if length(parts) >= 3, do: Enum.at(parts, 2) |> String.split("@") |> hd(), else: ""
  end

  defp parse_port(mysql_url) do
    parts = String.split(mysql_url, ":")
    if length(parts) >= 4 do
      Enum.at(parts, 3) |> String.split("/") |> hd() |> String.to_integer()
    else
      3306
    end
  end

  defp parse_database(mysql_url) do
    parts = String.split(mysql_url, "/")
    List.last(parts)
  end
end 