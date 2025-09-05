<?php

$rootDir    = '.';

$scannedDirectory = array_diff(scandir($rootDir), array('..', '.'));

foreach ($scannedDirectory as $dir) {
    $dirPath = "{$rootDir}/{$dir}";
    if(is_dir($dirPath)) {
        findFilesAndSaveNamesToFile($dirPath);
    }
}


function findFilesAndSaveNamesToFile(string $dirPath) 
{
    $scanned = scandir($dirPath);
    foreach ($scanned as $fileName) {
        $filePath = "{$dirPath}/{$fileName}";
    
        if(is_file($filePath))
        {
            $filePathParts = explode('/', $filePath);
            array_shift($filePathParts);

            $filePathWithSlashes = implode('/', $filePathParts);
            $filePathWithUnderscores = implode('_', $filePathParts);

            $string = "[type: markdown] en/{$filePathWithSlashes} \$lang:\$lang/{$filePathWithSlashes} pot={$filePathWithUnderscores}" . PHP_EOL;
            file_put_contents('./res.txt', $string, FILE_APPEND);

        }
    }
}