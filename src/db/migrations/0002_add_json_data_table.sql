-- Migration number: 0002 	 2024-09-18T13:17:25.229Z
CREATE TABLE IF NOT EXISTS json_data (data JSONB NOT NULL);

INSERT INTO
    json_data (data)
VALUES
    (
        '{"totalGuilds":9230,"totalUserInstalls":11000,"totalChannels":204662,"totalMembers":1278810,"totalStatsSent":{"total":299606,"games":{"Battlefield 2042":73492,"Battlefield V":90695,"Battlefield 1":47760,"Battlefield Hardline":2438,"Battlefield 4":48768,"Battlefield 3":7156,"Battlefield Bad Company 2":364,"Battlefield 2":578,"Battlefield 6":23784},"languages":{"English":204030,"French":10146,"Italian":1669,"German":8512,"Spanish":7113,"Russian":7949,"Polish":8264,"Brazilian Portuguese":11057,"Turkish":3153,"Swedish":1210,"Norwegian":208,"Finnish":1258,"Arabic":288,"Chinese":138,"Dutch":1}},"lastUpdated":{"date":"Tue, 26 Aug 2025 21:37:09 GMT","timestampMilliseconds":1756244229092,"timestampSeconds":1756244229}}'
    );