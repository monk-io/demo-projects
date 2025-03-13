defmodule ElixirService.MixProject do
  use Mix.Project

  def project do
    [
      app: :elixir_service,
      version: "0.1.0",
      elixir: "~> 1.12",
      start_permanent: Mix.env() == :prod,
      deps: deps()
    ]
  end

  def application do
    [
      mod: {ElixirService.Application, []},
      extra_applications: [:logger]
    ]
  end

  defp deps do
    [
      {:plug_cowboy, "~> 2.5"},
      {:redix, "~> 1.1"},
      {:mongodb_driver, "~> 0.7.0"},
      {:myxql, ">= 0.0.0"}
    ]
  end
end 