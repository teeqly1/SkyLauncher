#include <stdio.h>
#include <stdlib.h>

#ifdef _WIN32
#include <windows.h>
#endif

// SkyLauncher Native C Helper for Disk & Hardware Diagnostics
unsigned long long get_free_disk_space_mb(const char* drive_path) {
#ifdef _WIN32
    ULARGE_INTEGER free_bytes_available;
    ULARGE_INTEGER total_number_of_bytes;
    ULARGE_INTEGER total_number_of_free_bytes;

    if (GetDiskFreeSpaceExA(drive_path, &free_bytes_available, &total_number_of_bytes, &total_number_of_free_bytes)) {
        return free_bytes_available.QuadPart / (1024 * 1024);
    }
    return 0;
#else
    return 1024 * 1024; // Fallback mock 1 TB
#endif
}

int main(int argc, char* argv[]) {
    printf("[SkyLauncher C Native Engine]\n");
    const char* path = (argc > 1) ? argv[1] : "C:\\";
    unsigned long long free_mb = get_free_disk_space_mb(path);
    printf("Free space on %s: %llu MB (%.2f GB)\n", path, free_mb, (double)free_mb / 1024.0);
    return 0;
}
