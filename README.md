https://github.com/bradtraversy/devconnector_2.0

# Terminate server

ps aux | grep node
kill -9 PROCESS_ID
killall node
kill -9 $(ps aux | grep '\snode\s' | awk '{print $2}')
lsof -i tcp:3000

# Build react client

cd client
npm run build
