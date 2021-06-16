// Load all the channels within this directory and all subdirectories.
// Channel files must be named *_channel.js.

const channels = require.context('.', true, /_channel\.js$/)
channels.keys().forEach(channels)

var fullDateToday = new Date();
var dateTodayFormatted = fullDateToday.getDate() + "-" + fullDateToday.getMonth() + "-" + fullDateToday.getFullYear();

var html_element = "<h4 class='d-flex justify-content-between align-items-center mb-3'><span class='text-muted'>Hyderabad</span></h4><ul class='list-group mb-3'><li class='list-group-item'><h6 class='my-0'>Apollo Hospital Jubilee Hills</h6><ul class='list-group list-group-flush'><li class='list-group-item d-flex justify-content-between align-items-center'><small><b>16-06-2021</b><small class='text-muted'>Covishield | Paid | 780 INR </small></small><small class='badge badge-secondary badge-pill'> 1</small></li></ul></li></ul>"

$(window).on('load', function () {
  $('.state-selector').on('change', function () {
    var state_id = $(this).find(':selected')[0].value;
    $.ajax({
      type: 'GET',
      url: "https://cdn-api.co-vin.in/api/v2/admin/location/districts/" + state_id,
      success: function (data) {
        $.each(data, function (index) {
          $.each(this, function (district_id, district_name) {
            $.ajax({
              type: 'GET',
              url: "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=" + district_id + "&date=" + dateTodayFormatted,
              success: function (district_data) {
                console.log(district_data);
                $('.available-vaccines').append(html_element);
              }
            })
          })
        })
      }
    })
  })
});

function formatData(districts) {
  var availability = {}
  districts.each((district, district_index) => {
    let centers = api_get(`${VACCINE_BY_DISTRICT_URL}?district_id=${district.district_id}&date=${Date.today.strftime("%d-%m-%Y")}`).dig("centers");

    centers.each((center, center_index) => {
      if (!availability[district.district_name]) {
        availability[district.district_name] = {}
      };

      center.sessions.each((session) => {
        if (!availability[district.district_name][center.name]) {
          availability[district.district_name][center.name] = []
        };

        if (session[`available_capacity_dose${dose}`].positive && vaccines.any(v => (
          session.vaccine == v
        )) && session.min_age_limit == age.to_i) {
          availability[district.district_name][center.name].push({
            [`${session.date}`]: `${session.vaccine?.capitalize} | ${center.fee_type} | ${center.vaccine_fees?.find(fee => (
              fee.vaccine == session.vaccine
            ))?.dig("fee")} INR - ${session["available_capacity_dose" + dose.to_s]}`
          })
        }
      });

      if (availability[district.district_name][center.name].empty) {
        availability[district.district_name].delete(center.name)
      }
    });

    if (availability[district.district_name].empty) {
      availability.delete(district.district_name)
    }
  })
}