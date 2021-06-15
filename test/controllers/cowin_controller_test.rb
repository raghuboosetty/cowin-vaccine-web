require "test_helper"

class CowinControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get cowin_index_url
    assert_response :success
  end
end
