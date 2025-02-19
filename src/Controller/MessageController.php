<?php

namespace App\Controller;

use App\Service\MessageService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class MessageController extends AbstractController
{
    private $messageService;

    public function __construct(MessageService $messageService) {
        $this->messageService = $messageService;
    }
    
    #[Route('/message', name: 'get_message', methods: ['GET'])]
    public function getMessage() {
        return $this->render('message/index.html.twig');
    }

    #[Route('/message', name: 'send_message', methods: ['POST'])]
    public function sendMessage(Request $request) {
        $content = $request->get('content');
        $author = $this->getUser();
        if ($author) {
            $author = $author->getUserIdentifier();
        }
        else {
            throw new \Exception("No User is authenticated ! ");
        }
        $this->messageService->sendMessage($content, $author);
        return $this->redirect('message');
    }
}
