class Cowin
  DISTRICT_LIST_URL = "https://cdn-api.co-vin.in/api/v2/admin/location/districts/state_id"
  VACCINE_BY_DISTRICT_URL = "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict"

  attr_reader :state_id, :dose, :age, :vaccines, :date_range, :districts, :availability

  def initialize(opts={})
    @state_id = opts[:state_id]
    @dose = opts[:dose] || 1
    @age = opts[:age] || 18
    @vaccines = (opts[:vaccines] || []).empty? ? ['COVISHIELD', 'COVAXIN'] : opts[:vaccines]
    @districts = api_get(DISTRICT_LIST_URL.gsub("state_id", state_id.to_s)).dig("districts")
    @availability = {}
  end

  def fetch_vaccines
    Rails.logger.debug "Districts GET: #{api_get(DISTRICT_LIST_URL.gsub("state_id", state_id.to_s)).dig("districts")}"
    Rails.logger.debug "Districts: #{districts}"
    districts.each_with_index do |district, district_index|
      centers = api_get("#{VACCINE_BY_DISTRICT_URL}?district_id=#{district['district_id']}&date=#{Date.today.strftime('%d-%m-%Y')}").dig('centers')
      centers.each_with_index do |center, center_index|
        availability[district['district_name']] = {} unless availability[district['district_name']]
        center['sessions']&.each do |session|
          availability[district['district_name']][center['name']] = [] unless availability[district['district_name']][center['name']]
          if session["available_capacity_dose#{dose}"].positive? && vaccines.any? { |v| session['vaccine'] == v } && session['min_age_limit'] == age.to_i
            availability[district['district_name']][center['name']] << { 
              "#{session['date']}" => "#{session['vaccine']&.capitalize} | #{center['fee_type']} | #{center['vaccine_fees']&.find {|fee| fee['vaccine'] == session['vaccine'] }&.dig('fee')} INR - #{session['available_capacity_dose' + dose.to_s]}"
            }
          end
        end
        availability[district['district_name']].delete(center['name']) if availability[district['district_name']][center['name']].empty?
      end
      availability.delete(district['district_name']) if availability[district['district_name']] && availability[district['district_name']].empty?
    end
  end

  def self.state_options
    {
      1 => "Andaman And Nicobar Islands",
      2 => "Andhra Pradesh",
      3 => "Arunachal Pradesh",
      4 => "Assam",
      5 => "Bihar",
      6 => "Chandigarh",
      7 => "Chhattisgarh",
      8 => "Dadra And Nagar Haveli",
      9 => "Delhi",
      10 => "Goa",
      11 => "Gujarat",
      12 => "Haryana",
      13 => "Himachal Pradesh",
      14 => "Jammu And Kashmir",
      15 => "Jharkhand",
      16 => "Karnataka",
      17 => "Kerala",
      18 => "Ladakh",
      19 => "Lakshadweep",
      20 => "Madhya Pradesh",
      21 => "Maharashtra",
      22 => "Manipur",
      23 => "Meghalaya",
      24 => "Mizoram",
      25 => "Nagaland",
      26 => "Odisha",
      27 => "Puducherry",
      28 => "Punjab",
      29 => "Rajasthan",
      30 => "Sikkim",
      31 => "Tamil Nadu",
      32 => "Telangana",
      33 => "Tripura",
      34 => "Uttar Pradesh",
      35 => "Uttarakhand",
      36 => "West Bengal",
      37 => "Daman And Diu" }
  end

  def self.dose_options
    {
      "Dose 1": 1,
      "Dose 2": 2
    }
  end

  def self.vaccine_options
    {
      "Any": "",
      "Covaxin": 'COVAXIN',
      "Covishield": "COVISHIELD"
    }
  end

  def self.age_options
    {
      "18+": "18",
      "45+": "45"
    }
  end

private
  def api_get(url)
    headers = {
      'Accept-Language': 'hi_IN',
      'Host': 'cdn-api.co-vin.in',
      'Content-Type': 'application/json', 
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
    }
    begin
      JSON.parse(RestClient.get(url, headers))
    rescue => e
      p e
      {}
    end
  end
end