// Load all the channels within this directory and all subdirectories.
// Channel files must be named *_channel.js.

const channels = require.context('.', true, /_channel\.js$/)
channels.keys().forEach(channels)

var fullDateToday = new Date();
var dateTodayFormatted = fullDateToday.getDate() + "-" + (fullDateToday.getMonth() + 1) + "-" + fullDateToday.getFullYear();

var html_element = "<h4 class='d-flex justify-content-between align-items-center mb-3'><span class='text-muted'>Hyderabad</span></h4><ul class='list-group mb-3'><li class='list-group-item'><h6 class='my-0'>Apollo Hospital Jubilee Hills</h6><ul class='list-group list-group-flush'><li class='list-group-item d-flex justify-content-between align-items-center'><small><b>16-06-2021</b><small class='text-muted'>Covishield | Paid | 780 INR </small></small><small class='badge badge-secondary badge-pill'> 1</small></li></ul></li></ul>"
// $('.available-vaccines').append(html_element);

$(window).on('load', function () {
  vaccineAvailibility(['COVAXIN'], 18, "available_capacity_dose1");
});


function vaccineAvailibility(selected_vaccines, selected_age, selected_dose) {
  $('.state-selector').on('change', function () {
    $('.available-districts').empty();
    var state_id = $(this).find(':selected')[0].value;
    $.ajax({
      type: 'GET',
      url: "https://cdn-api.co-vin.in/api/v2/admin/location/districts/" + state_id,
      success: function (data) {
        $.each(data.districts, function (district_id, district_info) {
          $.ajax({
            type: 'GET',
            url: "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=" + district_info.district_id + "&date=" + dateTodayFormatted,
            success: function (district_data) {
              var district_counter = {};
              $.each(district_data.centers, function (center_index, center_data) {
                var center_counter = {};
                $.each(center_data.sessions, function (session_index, session_data) {
                  if (($.inArray(session_data.vaccine, selected_vaccines) != -1) &&
                    (session_data.min_age_limit == selected_age) &&
                    (session_data[selected_dose] > 0)) {
 
                    if (district_counter[district_info.district_name] == undefined) { district_counter[district_info.district_name] = 0 }
                    if (center_counter[center_data.name] == undefined) { center_counter[center_data.name] = 0 }

                    district_counter[district_info.district_name] += 1
                    center_counter[center_data.name] += 1

                    if (district_counter[district_info.district_name] == 1) {
                      $('.available-districts').append("<h4 class='d-flex justify-content-between align-items-center mb-3'><span class='text-muted'>" + district_info.district_name + "</span></h4>")
                    }

                    if (center_counter[center_data.name] == 1) {
                      $('.available-districts').append("<ul class='list-group mb-3'><li class='available-center-" + center_data.center_id +" list-group-item'><h6 class='my-0'>" + center_data.name +"</h6></li></ul>")
                    }
                    var fee = 0;
                    if (center_data.vaccine_fees != undefined) {
                      $.each(center_data.vaccine_fees, function (vacine_fee_index, vaccine_fee_data) {
                        fee = vaccine_fee_data.fee
                      })
                    }

                    $(".available-center-" + center_data.center_id).append("<ul class='list-group list-group-flush'><li class='list-group-item d-flex justify-content-between align-items-center'><small><b>" + session_data.date + "</b><small class='text-muted'> " + session_data.vaccine +" | "+ center_data.fee_type +" | "+ fee +" INR </small></small><small class='badge badge-secondary badge-pill'>"+ session_data[selected_dose] +"</small></li></ul>");
                  }
                })
              })
            }
          })
        })
      }
    })
  })
}

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