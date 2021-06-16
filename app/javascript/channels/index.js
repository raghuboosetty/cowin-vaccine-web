// Load all the channels within this directory and all subdirectories.
// Channel files must be named *_channel.js.

const channels = require.context('.', true, /_channel\.js$/)
channels.keys().forEach(channels)

var fullDateToday = new Date();
var dateTodayFormatted = fullDateToday.getDate() + "-" + (fullDateToday.getMonth() + 1) + "-" + fullDateToday.getFullYear();

$(window).on('load', function () {

  $("#get-availibility").on('click', function (event) {
    event.preventDefault();
    var selected_state_id = $('#state-select').find(':selected')[0].value;

    var selected_vaccines = new Array();
    if ($('#vaccine-select').find(':selected')[0].value != ""){
      $('#vaccine-select > option:selected').each(
        function (i) {
          selected_vaccines[i] = $(this).val();
      });
    }

    var selected_age = $('#age-select').find(':selected')[0].value;
    var selected_dose = $('#dose-select').find(':selected')[0].value;
    vaccineAvailibility(selected_state_id, selected_vaccines, selected_age, selected_dose);
  });
});

function vaccineAvailibility(selected_state_id, selected_vaccines, selected_age, selected_dose) {
  $('.available-districts').empty();
  $.ajax({
    type: 'GET',
    url: "https://cdn-api.co-vin.in/api/v2/admin/location/districts/" + selected_state_id,
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
                if (((selected_vaccines.length === 0) || ($.inArray(session_data.vaccine, selected_vaccines) != -1)) &&
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
                    $('.available-districts').append("<ul class='list-group mb-3'><li class='available-center-" + center_data.center_id + " list-group-item'><h6 class='my-0'>" + center_data.name +"</h6></li></ul>")
                  }
                  var fee = 0;
                  if (center_data.vaccine_fees != undefined) {
                    $.each(center_data.vaccine_fees, function (vacine_fee_index, vaccine_fee_data) {
                      if (vaccine_fee_data.vaccine == session_data.vaccine) {
                        fee = vaccine_fee_data.fee
                      }
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
}