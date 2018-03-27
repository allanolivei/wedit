#include <windows.h>
#include <fstream>

// char* json = "{\
//     \"widgets\":[\
//         {\
//             \"type\": \"text\",\
//             \"content\": \"Allan\",\
//             \"row\": 1,\
//             \"column\": 1,\
//             \"index\": 1,\
//             \"size\": 2\
//         },\
//         {\
//             \"type\": \"text\",\
//             \"content\": \"Angelica\",\
//             \"row\": 1,\
//             \"column\": 1,\
//             \"index\": 0,\
//             \"size\": 2\
//         },\
//         {\
//             \"type\": \"text\",\
//             \"content\": \"Nicole\",\
//             \"row\": 2,\
//             \"column\": 3,\
//             \"index\": 1,\
//             \"size\": 2\
//         }\
//     ]\
// }";

using namespace std;

int main()
{
    // char* teste = "allan";
     ShellExecute(NULL, "open", "index.html",
                 NULL, NULL, SW_SHOWNORMAL);

    //system("x-www-browser index.html");
    //system("open index.html");
    //system("xdg-open 'http://www.google.com'");
    //system("firefox -new-tab http://www.google.com");
    //system("x-www-browser http://www.google.com")
    
    return 0;
}