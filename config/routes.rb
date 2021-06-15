Rails.application.routes.draw do
  root "cowin#index"

  get "/cowin", to: "cowin#index"
  post "/cowin", to: "cowin#index"
end
