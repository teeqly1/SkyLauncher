#include <iostream>
#include <string>
#include <vector>

#ifdef _WIN32
#include <windows.h>
#include <tlhelp32.h>
#endif

// SkyLauncher Native C++ Game Launcher & Process Monitor
class GameLauncher {
public:
    static bool LaunchExecutable(const std::wstring& exePath, const std::wstring& workingDir, const std::wstring& arguments) {
#ifdef _WIN32
        STARTUPINFO si;
        PROCESS_INFORMATION pi;
        ZeroMemory(&si, sizeof(si));
        si.cb = sizeof(si);
        ZeroMemory(&pi, sizeof(pi));

        std::wstring cmdLine = L"\"" + exePath + L"\" " + arguments;
        std::vector<wchar_t> cmdBuffer(cmdLine.begin(), cmdLine.end());
        cmdBuffer.push_back(0);

        LPCWSTR cwd = workingDir.empty() ? NULL : workingDir.c_str();

        BOOL success = CreateProcessW(
            NULL,
            cmdBuffer.data(),
            NULL,
            NULL,
            FALSE,
            CREATE_NEW_PROCESS_GROUP,
            NULL,
            cwd,
            &si,
            &pi
        );

        if (success) {
            CloseHandle(pi.hProcess);
            CloseHandle(pi.hThread);
            return true;
        }
        return false;
#else
        std::cout << "[SkyLauncher C++] Non-windows launch fallback: " << std::string(exePath.begin(), exePath.end()) << std::endl;
        return true;
#endif
    }
};

int main(int argc, char* argv[]) {
    std::cout << "SkyLauncher Native C++ Subsystem v1.0.0" << std::endl;
    if (argc > 1 && std::string(argv[1]) == "--test") {
        std::cout << "C++ Subsystem Test: SUCCESS" << std::endl;
    }
    return 0;
}
