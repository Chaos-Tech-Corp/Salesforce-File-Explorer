# Salesforce File Explorer
 
v 2 / Work in Progress

Lightning component to navigrate throught the Salesforce libraries the user has access to.

Appexchange component [link](https://appexchange.salesforce.com/appxListingDetail?listingId=a0N3A00000FMkrEUAT) (still v.1)

![file explorer preview](static/main-screenshot.png?raw=true)

![empty folder](static/empty_folder.png?raw=true)

![scroll down folder](static/scroll_folder.png?raw=true)

![member management](static/member_management.png?raw=true)

### Notes

There have been major changes in how folders are retrieved and the communication between the different components, I belive is much simpler now.

Full Tree folder is loaded at once, still working on refreshing the tree when a new folder is created without having to refresh the entire component.

Using this component for the User selection: [Input Field Lookup](https://github.com/Chaos-Tech-Corp/Input-Field-Lookup)
