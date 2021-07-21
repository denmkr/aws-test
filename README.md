# Tennis Game Annotation Tool

### Application deploy on Amazon AWS
Two docker images (frontend and backend) are pushed into Amazon ECR and runned using Amazon ECS. The automatic deploy (CI/CD) works with Github Actions. The application runs on http://ec2-18-191-69-206.us-east-2.compute.amazonaws.com.

### Application usage
1. Firstly, you need to upload a video with a tennis game (click Video file button).
2. Then, upload ball trajectory data file if presented (click Ball data csv button). If there is no ball trajectory data, you can still use the application without uploading it. Example of ball positions data file: ball-trajectory-extraction/output/one-ball-extracted-csv-file.csv
3. If you have players positions data, upload the file clicking Players data csv button. The csv format for players positions data should be: "frame,player1_x,player1_y,player2_x,player2_y". Example of players positions data file: ball-trajectory-extraction/output/players_data.csv
4. Click Calibrate button to specify the tennis court position on video (court lines intersection points) and set up homography to calculate correct ball and players positions on the court.
5. Click Hand button to specify players playing hand (left-handed / right-handed)

### Game Annotation Tool - server
If you want to run the application without Docker, you can launch the server and Angular app separately. Game Annotation Tool server is needed for homography set up and translation image point coordinates to court point coordinates.

To run Flask application (the server), firstly you need to activate the environment (with installed libraries):\
`source venv/bin/activate`\
Then, specify the main server file:\
`export FLASK_APP=server.py`\
Run it:\
`flask run`

### Game Annotation Tool - application (Angular)
Game annotation application allows to annotate shots from a game, recording the ball bounce and player hit events.

To run Angular application, firstly install necessary dependencies using npm:\
`npm install`\
Then, you can launch the app:\
`ng serve`\
Application runs on localhost:4200.