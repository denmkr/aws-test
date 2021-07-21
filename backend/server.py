from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import json

from homography import *
from stroke import *

app = Flask(__name__)
CORS(app)

# Init
homography = Homography()
stroke = Stroke()

@app.route('/api/homography/position', methods=["GET"])
def getCourtPosition():
	x = json.loads(request.args.get('x'))
	y = json.loads(request.args.get('y'))

	# http://127.0.0.1:5000/api/homography/position?x=1148&y=233

	point = homography.transformPoint([x, y])

	return jsonify(point.tolist()), 200

@app.route('/api/homography/set', methods=["POST"])
def setHomography():
	points = np.array(request.json)
	points = homography.setSourcePoints(points)

	return jsonify([{'points': points.tolist()}]), 200

@app.route('/api/stroke/set', methods=["POST"])
def setStrokeProperties():
	net_points = np.array(request.json)
	points = stroke.setCourtNetPoints(net_points[0])

	return jsonify([{'points': points.tolist()}]), 200

@app.route('/api/stroke/side', methods=["GET"])
def getStrokeSide():
	player_x = json.loads(request.args.get('playerx'))
	player_y = json.loads(request.args.get('playery'))
	ball_x = json.loads(request.args.get('ballx'))
	ball_y = json.loads(request.args.get('bally'))
	is_right_hand = json.loads(request.args.get('right_hand'))

	stroke_side = stroke.getStrokeSide(np.array([player_x, player_y]), np.array([ball_x, ball_y]), is_right_hand)

	return jsonify([{'stroke_side': stroke_side}]), 200

@app.route('/api/stroke/player', methods=["GET"])
def getStrokePlayer():
	player1 = [json.loads(request.args.get('player1x')), json.loads(request.args.get('player1y'))]
	player2 = [json.loads(request.args.get('player2x')), json.loads(request.args.get('player2y'))]
	ball = [json.loads(request.args.get('ballx')), json.loads(request.args.get('bally'))]

	stroke_player = stroke.getStrokePlayer(player1, player2, ball)

	return jsonify([{'stroke_player': stroke_player}]), 200