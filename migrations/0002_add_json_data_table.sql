-- Migration number: 0002 	 2024-09-18T13:17:25.229Z
CREATE TABLE IF NOT EXISTS json_data (data JSONB NOT NULL);

INSERT INTO
    json_data (data)
VALUES
    (
        '{"totalGuilds":0,"totalChannels":0,"totalMembers":0,"totalStatsSent":{"total":227584,"games":{"Battlefield 2042":57119,"Battlefield V":78781,"Battlefield 1":37273,"Battlefield Hardline":2001,"Battlefield 4":41365,"Battlefield 3":5767,"Battlefield Bad Company 2":364,"Battlefield 2":344},"languages":{"English":150413,"French":5909,"Italian":1086,"German":5590,"Spanish":5304,"Russian":5967,"Polish":5965,"Brazilian Portuguese":8065,"Turkish":2659,"Swedish":858,"Norwegian":180,"Finnish":762,"Arabic":218}},"lastUpdated":{"date":"Wed, 18 Sep 2024 14:13:15 GMT","timestampMilliseconds":1726668795151,"timestampSeconds":1726668795}}'
    );