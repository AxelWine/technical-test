# Technical test
The following repository corresponds to a technical test in which the data is downloaded from a CSV file hosted on a server, and registers them using the Facebook API (Conversions API).

## Installation
To install the following code it is necessary to have NodeJS installed only.

## Configuration
You need to create a "config.json" file with the following structure:
```json
{
     "csv_url":"",
     "pixel_id":"",
     "conversion_api_token":""
}
```

It is important that `csv_url` points to a file path without redirects, in my case I have uploaded the CSV file to my own server, you can use the following url if you want.

> `https://axelwine.me/tmp/uploaded/example_events_file.csv`

After configuring the file, use the `npm install` command to install all the necessary dependencies.

## Execution
To execute the project, you must run the following command:
`npm start`.

The code will take care of processing all the CSV data transforming the data to the way the Meta API can understand it.

## Note
The code works with a specific CSV structure, that is, if you remove or change the position of a column, the code will stop working, since it is intended for this specific column structure.