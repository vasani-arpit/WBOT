#!/bin/bash

CHATID_FILE=${CHATID_FILE:-$1}
CHATID_FILE=${CHATID_FILE:-"chatIdStore/491704552266@c.us.json"}
NAME=$(jq '.contact.name' ${CHATID_FILE})
SHORTNAME=$(jq '.contact.shortname' ${CHATID_FILE})
PUSHNAME=$(jq '.contact.pushname' ${CHATID_FILE})
FORMATTEDNAME=$(jq '.contact.formattedName' ${CHATID_FILE})
NUMBER=$(jq '.contact.id' ${CHATID_FILE})
#CORRECT_ANSWERS=$(jq '.quiz[] | select(.id|(test("Pearl03[1-4]"))) | select(.isCompleted="true")' ${CHATID_FILE} | jq '.question[].reply.isCorrect' | grep true | wc -l)
#CORRECT_ANSWERS=$(jq '.quiz[] | select(.id|(test("Pearl03[5-8]"))) | select(.isCompleted="true")' ${CHATID_FILE} | jq '.question[].reply.isCorrect' | grep true | wc -l)
CORRECT_ANSWERS=$(jq '.quiz[] | select(.id|(test("Pearl03[5-9]"))) | select(.isCompleted="true")' ${CHATID_FILE} | jq '.question[].reply.isCorrect' | grep true | wc -l)
echo "${CORRECT_ANSWERS} name: ${NAME} shortname: ${SHORTNAME} pushname: ${PUSHNAME} formattedName: ${FORMATTEDNAME} id: ${NUMBER}"
