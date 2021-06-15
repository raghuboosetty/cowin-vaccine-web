require_relative "../lib/cowin"
class CowinController < ApplicationController
  def index
    if params[:state_id].present?
      @cv = Cowin.new(state_id: params[:state_id], dose: params[:dose], age: params[:age], vaccines: params[:vaccines].present? ? [params[:vaccines]] : [] )
      @cv.fetch_vaccines
    end
  end
end
