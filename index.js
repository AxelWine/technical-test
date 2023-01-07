// Load required modules
const csv = require("get-csv");
const downlaod = require("download-file");
const { Content, CustomData, DeliveryCategory, EventRequest, UserData, ServerEvent } = require("facebook-nodejs-business-sdk");

// Load configuration
const config = require("./config.json");
if( [config.conversion_api_token, config.pixel_id, config.csv_url].includes(undefined) ) {
    throw new Error("Missing configuration, please check config.json");
};

const access_token = config.conversion_api_token;
const pixel_id = config.pixel_id;

// Download the CSV file
const options = {
    directory: "./",
    filename: "data.csv"
}
downlaod(config.csv_url, options, async function(err){
    if( err ) {
        console.error(err);
        throw new Error("Error downloading CSV file");
    }
    else console.log("CSV file downloaded");

    // Read the CSV file
    const data = await csv("data.csv", {headers: false});
    
    // Reference:
    // · https://developers.facebook.com/docs/marketing-api/conversions-api/using-the-api
    
    const eventsData = [];

    // Iterate over the CSV data
    data.forEach((row,i) => {

        // Skip the first row
        if( i == 0 ) return;
        
        // Convert data in variables
        const emails = [row[0], row[1], row[2]];
        const phone = row[3];
        const madid = row[4];
        const fullname = row[5];
        const zip = row[6];
        const country = row[7];
        const gender = row[8];
        const action = row[9];
        const actionTime = row[10];
        const price = row[11];

        // Reference:
        // · https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters#client-user-agent
        
        // Format the email
        const convertedEmails = [];
        for( let email of emails ) convertedEmails.push(email.toLowerCase().trim());

        // Format the phone
        const convertedPhone = phone.replace(/[^0-9]+/g, '');

        // Format the name and surname
        const name = fullname.split(" ")[0];
        const surname = fullname.split(" ")[1];
        const convertedName = unescape(encodeURIComponent(name.toLowerCase().trim()));
        const convertedSurname = unescape(encodeURIComponent(surname.toLowerCase().trim()));

        // Format the gender
        const convertedGender = (gender.toLowerCase() == "male" ? "m" : "f");

        // Format the zip code
        // Note:
        //      According to the Meta documentation, UK zip codes should be
        //      formatted as area, district and sector, so can't just keep
        //      the numbers.
        const convertedZip = zip.replace("-"," ").split(" ")[0].toLowerCase().substring(0,5);

        // Format the country
        const convertedCountry = country.toLowerCase();

        // Format the price
        const convertedPrice = price.replaceAll(",",".").replace(/[^0-9.,]+/g, '')*1;
        const currencyTypes = [
            { name: "usd", symbol: "$" },
            { name: "eur", symbol: "€" },
            { name: "gbp", symbol: "£" },
            { name: "jpy", symbol: "¥" },
            { name: "cny", symbol: "¥" },
            { name: "inr", symbol: "₹" },
            { name: "rub", symbol: "₽" },
            { name: "krw", symbol: "₩" },
            { name: "try", symbol: "₺" }
        ];
        const currencyType = currencyTypes.find(currency => price.includes(currency.symbol)).name;

        // Format the action time
        const timestamp = Math.floor(new Date(actionTime) / 1000);
        
        const userData = new UserData()
            .setEmails(convertedEmails)
            .setPhone(convertedPhone)
            .setFirstName(convertedName)
            .setLastName(convertedSurname)
            .setGender(convertedGender)
            .setZip(convertedZip)
            .setCountry(convertedCountry)

        const content = new Content()
            .setId(madid)
            .setQuantity(1)
            .setDeliveryCategory(DeliveryCategory.HOME_DELIVERY);

        const customData = new CustomData()
            .setContents([content])
            .setCurrency(currencyType)
            .setValue(convertedPrice);

        const serverEvent = new ServerEvent()
            .setEventName(action)
            .setEventTime(timestamp)
            .setUserData(userData)
            .setCustomData(customData);

        eventsData.push(serverEvent);
    });
    
    const eventRequest = new EventRequest(access_token, pixel_id).setEvents(eventsData);

    eventRequest.execute().then(
        response => {
            console.log('Response: ', response);
        },
        err => {
            console.error('Error: ', err);
        }
    );
});