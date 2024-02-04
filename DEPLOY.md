## How to deploy WBOT on DigitalOcean?
1. Visit [Here](https://m.do.co/c/dd173aa6d77d) and create an account. you'll get $200 worth of free credits for 2 months. You can thank me for that later 😉

2. After creating an account you will see a page like below. Click on 'Deploy a virtual machine'.
   
   ![vm-ss](https://github.com/Kashvigandhi/WBOT/assets/114830226/fa150601-5335-4752-82a9-f720379eb7f9)

3. This will take you to a page like below. Select 'Spin up a Droplet'.
   
   ![Screenshot (55)](https://github.com/Kashvigandhi/WBOT/assets/114830226/2d66dbe4-c7a9-401f-9691-5e61f1ad3b3e)

4. Now, you need to select the specifications for the droplet. First select the server location that is closest to you. For instance, if you are in India, choose the Bangalore server.
   
   ![Screenshot (56)](https://github.com/Kashvigandhi/WBOT/assets/114830226/63266c24-c0f1-4180-a71e-3e6d7ee111ce)

5. Choose the ubuntu operating system with version 22 LTS. The CPU specifications are up to you. but we recommand you go with atleast 1 GB of RAM. 

   ![Screenshot (57)](https://github.com/Kashvigandhi/WBOT/assets/114830226/a4cdf1c7-e81e-48bf-836e-19e4fb3db2b6)

6. For the authentication, choose the password method and create one according to the requirements. Make sure to remember this password or copy it somewhere safe.
   
7. Finally, click on 'Create Droplet'. Your droplet had been created. Copy the ipv4 address of the droplet.
  
8. Now open the terminal on your device and give the following command. 
   
```bash 
ssh root@[your_ipv4_address]
```
Replace [your_ipv4_address] with the ipv4 address you copied. You will be asked the password you just made. You will not be able to see what you are typing, but don't worry! You will be authenticated if you enter the correct password.

_If this command doesn't work in your machine then you can go to digitalOcean and click on console. you can do rest of the commands there as well._

9. Clone our WBOT repository and move to that directory.
   
```bash 
git clone https://github.com/vasani-arpit/WBOT.git
cd WBOT
```

10. Run the following command to install requirements.
       
```bash 
sh setup/setup.sh
```
11. After you get the 'Setup Complete' message, you can run the WBOT using this command.
       
```bash 
npm start
```
12. You can graphically modify bot.json as well as view the current day's messages by going to your browser and entering the following site in the address bar.
       
```bash 
[your_ipv4_address]:8080
```
