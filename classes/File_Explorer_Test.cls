@isTest(SeeAllData=true) 
public class File_Explorer_Test {
  
    @isTest static void main_test() {
        List<ContentWorkspace> root = File_Explorer.loadRoot();
        File_Explorer.loadNode(root[0].RootContentFolderId);
        File_Explorer.expandNode(root[0].RootContentFolderId);
        File_Explorer.createNode(root[0].RootContentFolderId,'Demo for Testing');
        //File_Explorer.deleteNode(root[0].RootContentFolderId);
        //File_Explorer.deleteFile('');
        //File_Explorer.addFilesToNode('',[]);
        File_Explorer.findLibraryId(root[0].RootContentFolderId);
    }
 
    @isTest static void secondary_test() {
        //prevent two DML operations sequentially
        File_Explorer.createNode(null,'Demo for Testing');
    }
    
    @isTest static void tertiary_test() {
        //prevent two DML operations sequentially
        List<ContentWorkspace> root = File_Explorer.loadRoot();
        File_Explorer.renameNode(root[0].RootContentFolderId,'Demo for Testing');
    }
}